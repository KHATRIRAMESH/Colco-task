import { pool } from "../db/dbConnect.js";
import {
  FIND_USER_QUERY,
  CREATE_USER_QUERY,
  GET_USERS_QUERY,
  COUNT_USERS_QUERY,
  DELETE_USER_QUERY,
  buildUpdateUserQuery,
} from "../queries/user.queries.js";
import { camelToSnakeCase } from "../utils/converter.js";

export async function insertUser({
  firstName,
  lastName,
  email,
  password,
  phone,
  dobDate,
  gender,
  address,
  role,
}) {
  const values = [
    firstName,
    lastName,
    email,
    password,
    phone || null,
    dobDate || null,
    gender || null,
    address || null,
    role,
  ];

  console.log("Inserting user with values:", values);

  const result = await pool.query(CREATE_USER_QUERY, values);
  return result.rows[0];
}

// export async function updateUser(userId, updateData) {

export async function findUserByEmail(email) {
  const result = await pool.query(FIND_USER_QUERY, [
    String(email).trim().toLowerCase(),
  ]);
  return result.rows[0] || null;
}

export async function getUsers(page, limit) {
  const offset = (page - 1) * limit;

  const [countResult, users] = await Promise.all([
    pool.query(COUNT_USERS_QUERY),
    pool.query(GET_USERS_QUERY, [offset, limit]),
  ]);
  const total = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(total / limit);

  console.log(
    `Total users: ${total}, Total pages: ${totalPages}, Current page: ${page}, Users on this page: ${users.rows.length}`,
  );
  return {
    users: users.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export async function updateUserById(userId, updateData) {
  const allowedFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "gender",
    "dob",
    "address",
    "role",
  ];
  const updates = Object.entries(updateData).filter(
    ([key, value]) =>
      allowedFields.includes(key) &&
      value !== undefined &&
      value !== null &&
      value !== "",
  );
  if (updates.length === 0) {
    throw new Error("No valid fields provided for update");
  }

  const setClause = updates
    .map(([key], index) => `${camelToSnakeCase(key)} = $${index + 1}`)
    .join(", ");
  const values = updates.map(([, value]) => value);

  values.push(userId);
  console.log("Update user query values:", setClause, values.length);

  const updateQuery = buildUpdateUserQuery(setClause, values.length);

  const result = await pool.query(updateQuery, values);
  console.log("Update user result:", result.rows[0]);
  return result.rows[0];
}

export async function deleteUserById(userId) {
  const result = await pool.query(DELETE_USER_QUERY, [userId]);
  return result.rowCount > 0;
}
