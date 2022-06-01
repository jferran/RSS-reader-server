const router = require("express").Router();
const UserModel = require("../models/User.model")
const bcryptjs = require('bcryptjs')
const jwt = require("jsonwebtoken")
const isAuthenticated = require ('../middlewares/isAuthenticated.js')
// 3 rutas de auth
// POST "/api/auth/signup"
router.post("/signup", async (req, res, next) => {
    const { email, password, username } = req.body
    //Validaciones de backend
    if (!email || !password || !username){
        res.status(400).json({ errorMessage: "Los campos no estan completos" })
        return;
    }

    // aqui podrian haber otras validaciones, como complejidad de contraseña o formato de email

    try {
        //const foundUser = await UserModel.findOne({ email })
        const foundUser = await UserModel.findOne({ email })
        if (foundUser !== null) {
            res.status(400).json({ errorMessage: "Usuario ya registrado" })
            return;
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password, salt)

        await UserModel.create({
            username,
            email,
            password: hashPassword
        })

        res.json("todo bien, usuario creado")

    } catch (error) {
        next(error)
    }

})

//POST "/api/auth/login" => verificar las credenciales del usuario y abrirle "sesión"
router.post("/login", async (req, res, next) => {
    const { email, password } = req.body
    //todas nuestras validaciones de backend. No olvidar

    try {
        const foundUser = await UserModel.findOne({email})
        if(foundUser === null){
            res.status(400).json({errorMessage: 'Usuario no registrado'})
            return;
        }
        //el usuario ha sido validado
        const passwordMatch = await bcryptjs.compare(password, foundUser.password)
        console.log(passwordMatch) //true o false

        if(passwordMatch === false){
            res.status(401).json({errorMessage: 'La contraseña no es correcta'})
            return;
        }

        // el usuario es quien dice ser, y tiene sus credenciales correctas.
        //aqui es donde creariamos una session
        //peeero... en vez de eso, aqui es donde implementamos la autentificación por tokens

        const payload = {
            _id: foundUser._id,
            email: foundUser.email,
            username: foundUser.username
        } //recomendación es no guardar la contraseña
        //propiedades de isAdmin/VIP se recomiendan agregarlas para navegación

        const authToken = jwt.sign(
            payload,
            process.env.TOKEN_SECRET,
            { algorithm: 'HS256', expiresIn: '12h' }
        )
        res.json({ authToken: authToken })

    } catch (error) {
        next(error)        
    }

})

// GET "/api/auth/verify" => checkea que el token sea valido. La ruta se usa para flujo de FE
router.get("/verify", isAuthenticated, (req, res, next) => {
    //checkear que el token sea valido
    // enviar al frontend la info del usuario del token
    console.log(req.payload) // ! ESTO ES el req.session.user de M3
    console.log("todo bien con el middleware")
    res.json(req.payload)

})


module.exports = router;