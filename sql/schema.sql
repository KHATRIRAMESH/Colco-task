CREATE TYPE role_type as ENUM('super_admin', 'artist_manager', 'artist');

CREATE TYPE gender_type as ENUM('m', 'f', 'o');

CREATE TYPE genre_type as ENUM('rnb', 'country', 'classic', 'rock', 'jazz');

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first_name varchar (255) NOT NULL,
    last_name varchar (255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone varchar(20),
    dob DATE,
    gender gender_type,
    address varchar (255),
    role role_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    name TEXT NOT NULL,
    dob DATE,
    gender gender_type,
    address TEXT,
    first_release_year INT,
    no_of_albums_released INT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    album_name TEXT,
    genre genre_type,
    artist_id INT REFERENCES artists(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);