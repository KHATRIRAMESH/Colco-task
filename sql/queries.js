export const findUserByEmailQuery = `
    SELECT * FROM users WHERE email = $1
`;

export const createUserQuery = `
    INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *
`;
