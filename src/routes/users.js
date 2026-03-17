import { getRequestBody } from "../helper/bodyParse.js";
import { logInUserController, logOutUserController, registerUserController } from "../controllers/userController.js";

export async function getUsers(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ users: [] }));
}

export async function createUser(req, res) {
    const body = await getRequestBody(req);
    console.log('Received user data:', body);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User created' }));
}

//Login user controller
export async function logIn(req, res) {
    return logInUserController(req, res)
}

export async function logOut(req, res) {
    return logOutUserController(req, res);
}

//Register user controller
export async function registerUser(req, res) {
    return registerUserController(req, res);
}