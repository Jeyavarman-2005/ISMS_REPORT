from flask import Flask, request, jsonify, send_from_directory
import pyodbc
import bcrypt
import pandas as pd
from datetime import datetime
from functools import wraps
import os
import uuid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database connection
def get_db():
    conn = pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=JEY_JARVIS;'
        'DATABASE=AUDIT_DB;'
        'Trusted_Connection=yes;'
    )
    return conn

# Error handler
def handle_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            print(f'Error in {f.__name__}: {str(e)}')
            return jsonify({'error': str(e)}), 500
    return wrapper

# Authentication middleware
def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization token required'}), 401
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        if user['role'] != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        
        return f(*args, **kwargs)
    return wrapper

def verify_token(token):
    if not token:
        return None
    
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT UserID, Username, Role FROM Users 
            WHERE Token = ? AND Token IS NOT NULL
        """, (token,))
        user = cursor.fetchone()
        
        if user:
            return {
                'id': user[0],
                'username': user[1],
                'role': user[2]
            }
        return None
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        return None
    finally:
        if conn:
            conn.close()

    
    

@app.route('/api/login', methods=['POST'])
@handle_errors
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT UserID, Username, Password, Role FROM Users WHERE Username = ?", 
                  (data['username'],))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'Invalid credentials'}), 401
    
    user_id, username, password_hash, role = user
    
    if bcrypt.checkpw(data['password'].encode('utf-8'), password_hash.encode('utf-8')):
        # Generate and store token
        token = str(uuid.uuid4())
        cursor.execute("UPDATE Users SET Token = ? WHERE UserID = ?", (token, user_id))
        conn.commit()
        conn.close()
        
        return jsonify({
            'id': user_id,
            'username': username,
            'role': role,
            'token': token
        })
    
    conn.close()
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/users', methods=['GET'])
@handle_errors
@admin_required
def get_users():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT UserID as id, CompanyName, PlantName, Username, GenId, Email, Department, Role
        FROM Users ORDER BY CompanyName, Username
    """)
    
    columns = [column[0] for column in cursor.description]
    users = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(users)

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@handle_errors
@admin_required
def update_user(user_id):
    data = request.get_json()
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # First check if username is being changed to an existing one
        if 'username' in data:
            cursor.execute("SELECT UserID FROM Users WHERE Username = ? AND UserID != ?", 
                         (data['username'], user_id))
            if cursor.fetchone():
                return jsonify({'error': 'Username already exists'}), 400
        
        # Build update query
        update_fields = []
        params = []
        field_mapping = {
            'companyName': 'CompanyName',
            'plantName': 'PlantName',
            'username': 'Username',
            'genId': 'GenId',
            'email': 'Email',
            'department': 'Department',
            'role': 'Role'
        }
        
        for frontend_field, db_field in field_mapping.items():
            if frontend_field in data:
                update_fields.append(f"{db_field} = ?")
                params.append(data[frontend_field])
        
        if 'password' in data and data['password']:
            hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            update_fields.append("Password = ?")
            params.append(hashed_pw)
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        query = f"UPDATE Users SET {', '.join(update_fields)} WHERE UserID = ?"
        params.append(user_id)
        
        cursor.execute(query, params)
        conn.commit()
        
        return jsonify({'success': True}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@handle_errors
@admin_required
def delete_user(user_id):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM Users WHERE UserID = ?", (user_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({'success': True}), 200
    finally:
        conn.close()

@app.route('/api/users', methods=['POST'])
@handle_errors
@admin_required
def create_user():
    data = request.get_json()
    required_fields = ['companyName', 'username', 'password', 'email', 'department', 'role']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Hash password
    hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO Users (CompanyName, PlantName, Username, GenId, Password, Email, Department, Role)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (data['companyName'], data.get('plantName', ''), data['username'], 
                data.get('genId', ''), hashed_pw, data['email'], 
                data['department'], data['role']))
        conn.commit()
        return jsonify({'success': True}), 201
    except pyodbc.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 400
    finally:
        conn.close()

@app.route('/api/audits', methods=['GET'])
@handle_errors
def get_audit_data():
    audit_type = request.args.get('type', 'internal')
    if audit_type not in ['internal', 'external']:
        return jsonify({'error': 'Invalid audit type'}), 400
    
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # First check if table exists
        cursor.execute(f"""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = '{audit_type}_audits'
        """)
        
        if cursor.fetchone()[0] == 0:
            return jsonify({
                'data': [],
                'message': f'Table {audit_type}_audits does not exist yet',
                'lastUploadDate': None
            }), 404
        
        # Proceed with normal query if table exists
        cursor.execute(f"""
            SELECT 
                ID, SN, Location, DomainClauses, 
                CONVERT(varchar, DateOfAudit, 23) as DateOfAudit,
                CONVERT(varchar, DateOfSubmission, 23) as DateOfSubmission,
                NCMinI, ObservationDescription,
                RootCauseAnalysis, CorrectiveAction, PreventiveAction,
                Responsibility, 
                CONVERT(varchar, ClosingDates, 23) as ClosingDates,
                Status, Evidence,
                CONVERT(varchar, UploadDate, 120) as UploadDate
            FROM {audit_type}_audits 
            ORDER BY SN ASC
        """)
        
        columns = [column[0] for column in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return jsonify({
            'data': data,
            'lastUploadDate': data[0].get('UploadDate') if data else None
        })
    except pyodbc.Error as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/audits/last-upload', methods=['GET'])
@handle_errors
def get_last_upload_date():
    audit_type = request.args.get('type', 'internal')
    if audit_type not in ['internal', 'external']:
        return jsonify({'error': 'Invalid audit type'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(f"""
            SELECT MAX(UploadDate) as lastUploadDate 
            FROM {audit_type}_audits
        """)
        result = cursor.fetchone()
        return jsonify({
            'lastUploadDate': result[0] if result and result[0] else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/audits/upload', methods=['POST'])
@handle_errors
@admin_required
def upload_audit_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    audit_type = request.form.get('type', 'internal')
    
    if not (file.filename.lower().endswith('.xlsx') or file.filename.lower().endswith('.csv')):
        return jsonify({'error': 'Only Excel (.xlsx) or CSV (.csv) files are allowed'}), 400
    
    # Save the file temporarily
    file_ext = os.path.splitext(file.filename)[1].lower()
    filename = f"{audit_type}_audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    try:
        # Read file based on extension
        if file_ext == '.xlsx':
            df = pd.read_excel(filepath)
        elif file_ext == '.csv':
            # Try different encodings for CSV files
            encodings = ['utf-8', 'latin1', 'iso-8859-1', 'cp1252']
            for encoding in encodings:
                try:
                    df = pd.read_csv(filepath, encoding=encoding)
                    break
                except UnicodeDecodeError:
                    continue
            else:
                return jsonify({'error': 'Failed to decode CSV file. Please ensure it uses a standard encoding.'}), 400
        else:
            return jsonify({'error': 'Unsupported file format'}), 400
        
        # Validate columns
        required_columns = [
            'SN', 'Location', 'Domain/Clauses', 'Date of audit',
            'Date of submission of report', 'NC / MiN/ I *', 'Observation description'
        ]
        
        if not all(col in df.columns for col in required_columns):
            return jsonify({'error': 'Invalid file template format'}), 400
        
        # Process data
        df = df.rename(columns={
            'Domain/Clauses': 'DomainClauses',
            'NC / MiN/ I *': 'NCMinI',
            'Observation description': 'ObservationDescription'
        })
        
        # Convert to list of dictionaries
        records = df.to_dict('records')
        
        # Save to database
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            # Clear existing data
            cursor.execute(f"DELETE FROM {audit_type}_audits")
            
            # Insert new data
            for record in records:
                try:
                    cursor.execute(f"""
                        INSERT INTO {audit_type}_audits (
                            SN, Location, DomainClauses, DateOfAudit, DateOfSubmission,
                            NCMinI, ObservationDescription, UploadDate
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        str(record.get('SN') or ''),
                        str(record.get('Location') or ''),
                        str(record.get('DomainClauses') or ''),
                        pd.to_datetime(record.get('Date of audit'), errors='coerce'),
                        pd.to_datetime(record.get('Date of submission of report'), errors='coerce'),
                        str(record.get('NCMinI') or ''),
                        str(record.get('ObservationDescription') or ''),
                        datetime.now()
                    ))
                except Exception as e:
                    print(f"Failed to insert record: {record['SN']} — {e}")

            
            conn.commit()
            return jsonify({
                'success': True, 
                'count': len(records),
                'message': f'Successfully uploaded {len(records)} records'
            })
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

@app.route('/api/audits/update', methods=['POST'])
@handle_errors
def update_audit_record():
    data = request.get_json()
    audit_type = data.get('type')
    record = data.get('record')
    
    if not audit_type or audit_type not in ['internal', 'external']:
        return jsonify({'error': 'Invalid audit type'}), 400
    
    if not record or 'SN' not in record or 'Location' not in record or 'DateOfAudit' not in record:
        return jsonify({'error': 'Missing required record data'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(f"""
            UPDATE {audit_type}_audits SET
                RootCauseAnalysis = ?,
                CorrectiveAction = ?,
                PreventiveAction = ?,
                Responsibility = ?,
                ClosingDates = ?,
                Status = ?,
                Evidence = ?
            WHERE SN = ? AND Location = ? AND DateOfAudit = ?
        """, (
            record.get('RootCauseAnalysis'),
            record.get('CorrectiveAction'),
            record.get('PreventiveAction'),
            record.get('Responsibility'),
            record.get('ClosingDates'),
            record.get('Status', 'Open'),
            record.get('Evidence'),
            record['SN'],
            record['Location'],
            record['DateOfAudit']
        ))
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Record not found or not updated'}), 404
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Record updated successfully'})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/audits/upload-evidence', methods=['POST'])
@handle_errors
def upload_evidence():
    # Check if file exists

    print("Upload evidence endpoint hit!")  # Debug line
    print(request.files)  # Debug line

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    record_id = request.form.get('record_id')
    audit_type = request.form.get('audit_type')
    
    # Validate record_id is numeric
    if not record_id or not record_id.isdigit():
        return jsonify({'error': 'Invalid record ID'}), 400
        
    if not audit_type or audit_type not in ['internal', 'external']:
        return jsonify({'error': 'Invalid audit type'}), 400
        
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    # Validate file extension
    allowed_extensions = {'pdf', 'pptx', 'png', 'jpeg', 'jpg'}
    if '.' not in file.filename or \
       file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'Invalid file type'}), 400

    # Generate unique filename
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"evidence_{record_id}_{uuid.uuid4().hex[:8]}.{file_ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    # Update database record
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(f"""
            UPDATE {audit_type}_audits
            SET Evidence = ?, Status = 'Closed'
            WHERE ID = ?
        """, (filename, record_id))
        conn.commit()
        return jsonify({'success': True, 'filename': filename})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Add this route to serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)