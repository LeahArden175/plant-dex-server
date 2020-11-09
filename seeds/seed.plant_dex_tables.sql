BEGIN;

TRUNCATE
plant_dex_users,
plant_dex_plant_info
RESTART IDENTITY CASCADE;

INSERT INTO plant_dex_users(username, full_name, nickname, password)
VALUES
    ('dunder', 'Dunder Mifflin', null, 'password'),
    ('b.deboop', 'Bodeep Deboop', 'Bo', 'bo-password'),
    ('c.bloggs', 'Charlie Bloggs', 'Charlie', 'charlie-password'),
    ('s.smith', 'Sam Smith', 'Sam', 'sam-password'),
    ('lexlor', 'Alex Taylor', 'Lex', 'lex-password'),
    ('wippy', 'Ping Won In', 'Ping', 'ping-password');

INSERT INTO plant_dex_plant_info(nickName, scientificName, datePurchased, purchasePlace, user_id)
VALUES
    ('UFO Plant', 'Pilea Peperomiodes', '2020-02-08', 'Father Natures', 1),
    ('Musaica', 'Calathea Musaica', '2020-02-08', 'Plant Vine', 1),
    ('Mini Monstera', 'Raphidaphora Tetrasperma', '2020-02-08', 'Etsy', 1),
    ('Macualta', 'Begonia Maculata Wightii', '2020-02-08', 'Logees', 1);

COMMIT;