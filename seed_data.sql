-- Disable foreign key checks to safely truncate and insert
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate existing data from the target tables
TRUNCATE TABLE request_transfer_history;
TRUNCATE TABLE request_transfer;
TRUNCATE TABLE transfer;
TRUNCATE TABLE folder;

-- 1. Insert folders (Dossiers)
-- Folder Symbols:
-- '1101' = Civil cases (مدني متنوع)
-- '1201' = Commercial cases (تجاري)
-- '1501' = Family affairs (شؤون الأسرة)
-- '1601' = Criminal / Traffic cases (جنحي سير)
-- Creator Users:
-- 2 = ahmed (SESSION_CLERK)
-- 3 = fatima (CLERK)
INSERT INTO folder (folder_id, created_by, folder_symbol, created_at, folder_year, folder_number, statuts) VALUES
(1, 3, '1101', '2024-02-15', 2024, '12', 'ARCHIVED'),
(2, 3, '1201', '2024-08-20', 2024, '85', 'ARCHIVED'),
(3, 3, '1501', '2025-01-10', 2025, '142', 'ARCHIVED'),
(4, 2, '1201', '2025-04-12', 2025, '305', 'IN_DELIBERATION'),
(5, 2, '1101', '2025-07-22', 2025, '512', 'DRAFTED'),
(6, 2, '1601', '2025-09-18', 2025, '620', 'DRAFTED'),
(7, 2, '1601', '2026-01-15', 2026, '14', 'IN_SESSION'),
(8, 3, '1501', '2026-03-02', 2026, '55', 'CREATION'),
(9, 3, '1101', '2026-04-10', 2026, '89', 'DRAFTED'),
(10, 2, '1201', '2026-05-20', 2026, '112', 'IN_SESSION'),
(11, 3, '1101', '2026-06-10', 2026, '170', 'CREATION');

-- 2. Insert transfers
-- Users:
-- 2 = ahmed (SESSION_CLERK)
-- 3 = fatima (CLERK)
-- 4 = karim (ARCHIVE_OFFICER)
INSERT INTO transfer (transfer_id, from_user, to_user, folder_id, purpose, status, transfer_date) VALUES
(1, 3, 4, 1, 'إرسال الملف للأرشيف بعد صدور الحكم النهائي', 'RECEIVED', '2024-05-12'),
(2, 3, 4, 2, 'حفظ الملف في الأرشيف النهائي', 'RECEIVED', '2024-11-06'),
(3, 3, 4, 3, 'أرشفة ملف النفقة والطلاق', 'RECEIVED', '2025-03-03'),
(4, 3, 2, 9, 'تحويل الملف لمقرر الجلسة للمراجعة والجدولة', 'RECEIVED', '2026-05-04');

-- 3. Insert transfer requests (request_transfer)
-- Handled by:
-- 2 = ahmed (SESSION_CLERK)
-- 4 = karim (ARCHIVE_OFFICER)
INSERT INTO request_transfer (request_transfer_id, purpose, status, request_date, handled_by, created_by, transfer_id, folder_id) VALUES
(1, 'إرسال الملف للأرشيف بعد صدور الحكم النهائي', 'ACCEPTED', '2024-05-12', 4, 3, 1, 1),
(2, 'حفظ الملف في الأرشيف النهائي', 'ACCEPTED', '2024-11-06', 4, 3, 2, 2),
(3, 'أرشفة ملف النفقة والطلاق', 'ACCEPTED', '2025-03-03', 4, 3, 3, 3),
(4, 'تحويل الملف لمقرر الجلسة للمراجعة والجدولة', 'ACCEPTED', '2026-05-04', 2, 3, 4, 9),
(5, 'طلب أرشفة ملف بعد تحرير الحكم', 'PENDING', '2025-10-05', 4, 2, NULL, 5),
(6, 'طلب إحالة للأرشفة', 'REJECTED', '2025-11-22', 4, 2, NULL, 6);

-- 4. Insert transfer request history (request_transfer_history)
INSERT INTO request_transfer_history (history_id, request_transfer_id, status, request_date, handled_by) VALUES
(1, 1, 'ACCEPTED', '2024-05-12', 4),
(2, 2, 'ACCEPTED', '2024-11-06', 4),
(3, 3, 'ACCEPTED', '2025-03-03', 4),
(4, 4, 'ACCEPTED', '2026-05-04', 2),
(5, 6, 'REJECTED', '2025-11-22', 4);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
