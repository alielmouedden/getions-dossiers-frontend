import random
from datetime import datetime, timedelta

# Fix seed for reproducibility
random.seed(42)

# Date range: Feb 1, 2026 to June 26, 2026
start_date = datetime(2026, 2, 1)
end_date = datetime(2026, 6, 26)
delta_days = (end_date - start_date).days

def get_random_date(start, max_offset_days):
    offset = random.randint(0, max_offset_days)
    return start + timedelta(days=offset)

symbols = ['1101', '1201', '1501', '1601']

purposes_archive = [
    "طلب أرشفة الملف بعد صدور الحكم النهائي الحائز لقوة الشيء المقضي به",
    "حفظ الملف في الأرشيف النهائي للمحكمة بعد إتمام التنفيذ",
    "أرشفة ملف القضية بعد تصفية الحسابات وإنهاء الخصومة",
    "إرسال الملف للأرشيف الإلكتروني والورقي بعد إغلاقه"
]

purposes_transfer = [
    "إحالة الملف إلى كاتب الجلسة لجدولة القضية",
    "إرسال الملف إلى رئيس كتابة الضبط للمصادقة",
    "طلب إحالة الملف قصد إجراء خبرة حسابية",
    "تحويل الملف لشعبة التطليق للتبليغ",
    "إحالة الملف للنيابة العامة لتقديم المستنتجات",
    "إرجاع الملف للشعبة المدنية بعد انتهاء إجراءات التحقيق",
    "إحالة الملف إلى خلية التحديث والرقمنة",
    "إرسال الملف للمفوض القضائي قصد التبليغ والتعذير"
]

folders = []
transfers = []
requests = []
histories = []

folder_id_counter = 1
transfer_id_counter = 1
request_id_counter = 1
history_id_counter = 1

# 1. CREATION status: 25 folders
for _ in range(25):
    fid = folder_id_counter
    folder_id_counter += 1
    
    created_by = random.choice([2, 3]) # ahmed (2) or fatima (3)
    symbol = random.choice(symbols)
    year = 2026
    number = str(fid)
    created_at = get_random_date(start_date, delta_days - 2)
    
    folders.append((fid, created_by, symbol, created_at.strftime('%Y-%m-%d'), year, number, 'CREATION'))

# 2. IN_SESSION status: 20 folders
for _ in range(20):
    fid = folder_id_counter
    folder_id_counter += 1
    
    created_by = random.choice([2, 3])
    symbol = random.choice(symbols)
    year = 2026
    number = str(fid)
    created_at = get_random_date(start_date, delta_days - 5)
    
    folders.append((fid, created_by, symbol, created_at.strftime('%Y-%m-%d'), year, number, 'IN_SESSION'))

# 3. IN_DELIBERATION status: 15 folders
for _ in range(15):
    fid = folder_id_counter
    folder_id_counter += 1
    
    created_by = random.choice([2, 3])
    symbol = random.choice(symbols)
    year = 2026
    number = str(fid)
    created_at = get_random_date(start_date, delta_days - 10)
    
    folders.append((fid, created_by, symbol, created_at.strftime('%Y-%m-%d'), year, number, 'IN_DELIBERATION'))

# 4. DRAFTED status: 15 folders
# - 5: no transfers/requests (we will add accepted transfers to 3 of them later)
# - 5: PENDING request transfer
# - 5: REJECTED request transfer
for i in range(15):
    fid = folder_id_counter
    folder_id_counter += 1
    
    created_by = random.choice([2, 3])
    symbol = random.choice(symbols)
    year = 2026
    number = str(fid)
    created_at = get_random_date(start_date, delta_days - 15)
    
    folders.append((fid, created_by, symbol, created_at.strftime('%Y-%m-%d'), year, number, 'DRAFTED'))
    
    if 5 <= i < 10:
        # PENDING request transfer
        req_id = request_id_counter
        request_id_counter += 1
        
        handled_by = random.choice([4, (3 if created_by == 2 else 2)])
        purpose = random.choice(purposes_transfer if handled_by != 4 else purposes_archive)
        req_date = created_at + timedelta(days=random.randint(1, 7))
        if req_date > end_date:
            req_date = end_date
            
        requests.append((req_id, purpose, 'PENDING', req_date.strftime('%Y-%m-%d'), handled_by, created_by, 'NULL', fid))
        
    elif 10 <= i < 15:
        # REJECTED request transfer
        req_id = request_id_counter
        request_id_counter += 1
        
        handled_by = random.choice([4, (3 if created_by == 2 else 2)])
        purpose = random.choice(purposes_transfer if handled_by != 4 else purposes_archive)
        req_date = created_at + timedelta(days=random.randint(1, 5))
        handled_date = req_date + timedelta(days=random.randint(1, 3))
        if handled_date > end_date:
            handled_date = end_date
            req_date = handled_date - timedelta(days=1)
            
        requests.append((req_id, purpose, 'REJECTED', req_date.strftime('%Y-%m-%d'), handled_by, created_by, 'NULL', fid))
        
        hist_id = history_id_counter
        history_id_counter += 1
        histories.append((hist_id, req_id, 'REJECTED', handled_date.strftime('%Y-%m-%d'), handled_by))

# 5. ARCHIVED status: 25 folders
# - Has an ACCEPTED request transfer to karim (4)
# - Has a transfer record
# - Has a history record
for _ in range(25):
    fid = folder_id_counter
    folder_id_counter += 1
    
    created_by = random.choice([2, 3])
    symbol = random.choice(symbols)
    year = 2026
    number = str(fid)
    created_at = get_random_date(start_date, delta_days - 20)
    
    folders.append((fid, created_by, symbol, created_at.strftime('%Y-%m-%d'), year, number, 'ARCHIVED'))
    
    req_id = request_id_counter
    request_id_counter += 1
    
    tid = transfer_id_counter
    transfer_id_counter += 1
    
    handled_by = 4 # karim (ARCHIVE_OFFICER)
    purpose = random.choice(purposes_archive)
    req_date = created_at + timedelta(days=random.randint(1, 10))
    handled_date = req_date + timedelta(days=random.randint(1, 4))
    if handled_date > end_date:
        handled_date = end_date
        req_date = handled_date - timedelta(days=2)
        
    transfers.append((tid, created_by, handled_by, fid, purpose, 'RECEIVED', handled_date.strftime('%Y-%m-%d')))
    requests.append((req_id, purpose, 'ACCEPTED', req_date.strftime('%Y-%m-%d'), handled_by, created_by, tid, fid))
    
    hist_id = history_id_counter
    history_id_counter += 1
    histories.append((hist_id, req_id, 'ACCEPTED', handled_date.strftime('%Y-%m-%d'), handled_by))

# Convert some of the drafted folders to have ACCEPTED transfers to clerks
for i in range(3):
    # Drafted folders start at index 60 (25 CREATION + 20 IN_SESSION + 15 IN_DELIBERATION)
    fid = folders[60 + i][0]
    created_by = folders[60 + i][1]
    created_at_str = folders[60 + i][3]
    created_at = datetime.strptime(created_at_str, '%Y-%m-%d')
    
    req_id = request_id_counter
    request_id_counter += 1
    
    tid = transfer_id_counter
    transfer_id_counter += 1
    
    handled_by = 3 if created_by == 2 else 2
    purpose = random.choice(purposes_transfer)
    req_date = created_at + timedelta(days=random.randint(1, 5))
    handled_date = req_date + timedelta(days=random.randint(1, 3))
    if handled_date > end_date:
        handled_date = end_date
        req_date = handled_date - timedelta(days=1)
        
    transfers.append((tid, created_by, handled_by, fid, purpose, 'RECEIVED', handled_date.strftime('%Y-%m-%d')))
    requests.append((req_id, purpose, 'ACCEPTED', req_date.strftime('%Y-%m-%d'), handled_by, created_by, tid, fid))
    
    hist_id = history_id_counter
    history_id_counter += 1
    histories.append((hist_id, req_id, 'ACCEPTED', handled_date.strftime('%Y-%m-%d'), handled_by))

# Output SQL file content
sql_lines = [
    "-- Disable foreign key checks to safely truncate and insert",
    "SET FOREIGN_KEY_CHECKS = 0;",
    "",
    "TRUNCATE TABLE request_transfer_history;",
    "TRUNCATE TABLE request_transfer;",
    "TRUNCATE TABLE transfer;",
    "TRUNCATE TABLE folder;",
    "",
    "-- 1. Insert folders (Dossiers)"
]

for f in folders:
    sql_lines.append(f"INSERT INTO folder (folder_id, created_by, folder_symbol, created_at, folder_year, folder_number, statuts) VALUES ({f[0]}, {f[1]}, '{f[2]}', '{f[3]}', {f[4]}, '{f[5]}', '{f[6]}');")

sql_lines.append("\n-- 2. Insert transfers")
for t in transfers:
    sql_lines.append(f"INSERT INTO transfer (transfer_id, from_user, to_user, folder_id, purpose, status, transfer_date) VALUES ({t[0]}, {t[1]}, {t[2]}, {t[3]}, '{t[4]}', '{t[5]}', '{t[6]}');")

sql_lines.append("\n-- 3. Insert requests")
for r in requests:
    tid_val = str(r[6])
    sql_lines.append(f"INSERT INTO request_transfer (request_transfer_id, purpose, status, request_date, handled_by, created_by, transfer_id, folder_id) VALUES ({r[0]}, '{r[1]}', '{r[2]}', '{r[3]}', {r[4]}, {r[5]}, {tid_val}, {r[7]});")

sql_lines.append("\n-- 4. Insert histories")
for h in histories:
    sql_lines.append(f"INSERT INTO request_transfer_history (history_id, request_transfer_id, status, request_date, handled_by) VALUES ({h[0]}, {h[1]}, '{h[2]}', '{h[3]}', {h[4]});")

sql_lines.append("\nSET FOREIGN_KEY_CHECKS = 1;")

# Write to file
with open('seed_data_100.sql', 'w', encoding='utf-8') as file:
    file.write('\n'.join(sql_lines))
print("Successfully generated seed_data_100.sql with 100 logical folders and workflow items.")
