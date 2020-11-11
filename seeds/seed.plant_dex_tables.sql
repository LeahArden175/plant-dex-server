BEGIN;

TRUNCATE
plant_dex_users,
plant_dex_plant_info
RESTART IDENTITY CASCADE;

INSERT INTO plant_dex_users(username, full_name, nickname, password)
VALUES
    ('dunder', 'Dunder Mifflin', null, '$2a$12$YHsYg0Ccyu4fcRZCGcKID.ygEg6iFKoCupozHn7MFUceGeN.OMCZa'),
    ('b.deboop', 'Bodeep Deboop', 'Bo', '$2a$12$9GPJT8jnq.hPSsD.Vs0wU.YPGnpIBOxvYiNdHEP9n0iq.7p0F6gPW'),
    ('c.bloggs', 'Charlie Bloggs', 'Charlie', '$2a$12$C5dzQvWBURN8xpM.PoeX6OPf.QfSeaJFKvGzp67Iis/BNha3Gtr2C'),
    ('s.smith', 'Sam Smith', 'Sam', '$2a$12$jJxocErMZDKlTyjnXR66Hus20fF2FeHNytRB.HFwWpghdeqZH78rm'),
    ('lexlor', 'Alex Taylor', 'Lex', '$2a$12$GPrYSy0nZERpX7/9/wWK.eDhgG1padHhimQjgmYTKv3Ob1j7beeOS'),
    ('wippy', 'Ping Won In', 'Ping', '$2a$12$n3eClHuvbaetnPR2ZBNCo.GcMOd2U7jqSyVa1L7w/XkxWAXM/1Op6');

INSERT INTO plant_dex_plant_info(nickName, scientificName, datePurchased, purchasePlace, user_id)
VALUES
    ('UFO Plant', 'Pilea Peperomiodes', '2020-02-08', 'Father Natures', 1),
    ('Musaica', 'Calathea Musaica', '2020-02-08', 'Plant Vine', 1),
    ('Mini Monstera', 'Raphidaphora Tetrasperma', '2020-02-08', 'Etsy', 1),
    ('Macualta', 'Begonia Maculata Wightii', '2020-02-08', 'Logees', 1);

COMMIT;