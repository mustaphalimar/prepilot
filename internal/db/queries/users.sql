-- name: GetUser :one
SELECT * FROM users WHERE id = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 LIMIT 1;

-- name: GetUserByClerkID :one
SELECT * FROM users WHERE clerk_id = $1 LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (clerk_id, email, first_name, last_name, name, image_url, email_verified, last_sign_in_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: UpdateUser :one
UPDATE users 
SET 
    email = COALESCE($2, email),
    first_name = COALESCE($3, first_name),
    last_name = COALESCE($4, last_name),
    name = COALESCE($5, name),
    image_url = COALESCE($6, image_url),
    email_verified = COALESCE($7, email_verified),
    last_sign_in_at = COALESCE($8, last_sign_in_at),
    updated_at = NOW()
WHERE clerk_id = $1
RETURNING *;

-- name: UpsertUserByClerkID :one
INSERT INTO users (clerk_id, email, first_name, last_name, name, image_url, email_verified, last_sign_in_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (clerk_id) 
DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    name = EXCLUDED.name,
    image_url = EXCLUDED.image_url,
    email_verified = EXCLUDED.email_verified,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    updated_at = NOW()
RETURNING *;

-- name: BanUser :exec
UPDATE users SET banned = true, updated_at = NOW() WHERE clerk_id = $1;

-- name: UnbanUser :exec
UPDATE users SET banned = false, updated_at = NOW() WHERE clerk_id = $1;

-- name: DeleteUserByClerkID :exec
DELETE FROM users WHERE clerk_id = $1;
