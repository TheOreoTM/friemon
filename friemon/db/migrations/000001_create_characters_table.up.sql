CREATE TABLE characters (
    id UUID PRIMARY KEY,
    owner_id VARCHAR(255) NOT NULL,
    claimed_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    idx INT NOT NULL,
    character_id INT NOT NULL,
    level INT NOT NULL DEFAULT 1,
    xp INT NOT NULL DEFAULT 0,
    personality VARCHAR(50) NOT NULL,
    shiny BOOLEAN NOT NULL DEFAULT FALSE,
    iv_hp INT NOT NULL,
    iv_atk INT NOT NULL,
    iv_def INT NOT NULL,
    iv_sp_atk INT NOT NULL,
    iv_sp_def INT NOT NULL,
    iv_spd INT NOT NULL,
    iv_total FLOAT NOT NULL,
    nickname VARCHAR(255) NOT NULL DEFAULT '',
    favourite BOOLEAN NOT NULL DEFAULT FALSE,
    held_item INT NOT NULL DEFAULT -1,
    moves INT[] DEFAULT '{}',
    color INT NOT NULL
);
