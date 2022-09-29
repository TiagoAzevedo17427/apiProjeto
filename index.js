require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Router, response } = require("express");

const corsOptions = {
  origin: "https://melodic-duckanoo-cafd3f.netlify.app",
  credentials: true,
  methods: "GET,PUT,POST,DELETE",
  allowedHeaders: [
    "Content-Type",
    "Accept",
    "Origin",
    "X-Requested-With",
    "Authorization",
    "Set-Cookie",
  ],
};

const PORT = process.env.PORT || 3333;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.enable("trust proxy");

const isUserLoggedIn = async (req, res, next) => {
  //console.log(req);
  console.log(req.rawHeaders);
  try {
    // check if the token is in the cookies
    //const token = req.rawHeaders[13].split("=")[1];
    const token =
      req.rawHeaders[req.rawHeaders.indexOf("Cookie") + 1].split("=")[1];
    console.log(token);

    if (token) {
      // verify token

      const payload = await jwt.verify(token, process.env.SECRET);
      //console.log(payload);
      // add payload to request
      req.payload = payload;
      // move on
      next();
    } else {
      throw "Not Logged In";
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

const isAdmin = async (req, res, next) => {
  //console.log((req.rawHeaders[13]).split("=")[1])´
  //console.log(req.rawHeaders);
  try {
    //console.log(req.rawHeaders[req.rawHeaders.indexOf('Cookie') + 1])
    // check if the token is in the cookies
    console.log(req)
    const token =
      req.rawHeaders[req.rawHeaders.indexOf("Cookie") + 1].split("=")[1];
    //console.log(token)

    if (token) {
      // verify token

      const payload = await jwt.verify(token, "${process.env.SECRET}");
      //console.log(payload);
      // add payload to request
      req.payload = payload;
      // move on
      if (req.payload.userrole) next();
      else {
        throw "Not Admin In";
      }
    } else {
      throw "Not Admin In 2";
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

//ENSINO
app.get("/ensino", async (req, res) => {
  //console.log('lhe da');

  try {
    const { rows } = await pool.query(
      `SELECT * FROM recursos WHERE recurso_tipo = 'ensino' ORDER BY recurso_id ASC `
    );
    return res.status(200).send(rows);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.post("/ensino", isUserLoggedIn, async (req, res) => {
  const user = req.payload;
  const recurso = req.body;

  try {
    const newRecurso = await pool.query(
      `INSERT INTO recursos (recurso_tipo, recurso_titulo, recurso_descricao, recurso_link, recurso_imagem, recurso_online, user_id) 
      VALUES ('ensino', '${recurso.recurso_titulo}', '${recurso.recurso_descricao}', '${recurso.recurso_link}',
      '${recurso.recurso_imagem}', false, ${user.userid})`
    );
    return res.status(200).send(newRecurso.rows);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.put("/ensino/:recurso_id", isAdmin, async (req, res) => {
  const recurso = req.body;
  const id = req.params;
  try {
    const updateRecurso = await pool.query(
      `UPDATE recursos SET recurso_tipo= '${recurso.recurso_tipo}', recurso_titulo= '${recurso.recurso_titulo}', 
      recurso_descricao='${recurso.recurso_descricao}', recurso_link='${recurso.recurso_link}', recurso_imagem='${recurso.recurso_imagem}' 
      WHERE recurso_id= (${id.recurso_id})`
    );
    return res.status(200).send({
      message: `Ensino updated successfully ${id.recurso_id}`,
      updatedRecurso: updateRecurso.rows[0],
    });
  } catch (err) {
    return res.status(404).send(err);
  }
});

//FERRAMENTAS
app.get("/ferramentas", async (req, res) => {
  //console.log('lhe da');

  try {
    const { rows } = await pool.query(
      `SELECT * FROM recursos WHERE recurso_tipo = 'ferramentas' ORDER BY recurso_id ASC`
    );
    return res.status(200).send(rows);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.post("/ferramentas", isUserLoggedIn, async (req, res) => {
  const user = req.payload;
  const recurso = req.body;

  try {
    const newRecurso = await pool.query(
      `INSERT INTO recursos (recurso_tipo, recurso_titulo, recurso_descricao, recurso_link, recurso_imagem, recurso_online, user_id) 
      VALUES ('ferramentas', '${recurso.recurso_titulo}', '${recurso.recurso_descricao}', '${recurso.recurso_link}',
      '${recurso.recurso_imagem}', false, ${user.userid})`
    );
    return res.status(200).send(newRecurso.rows);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.put("/ferramentas/:recurso_id", isAdmin, async (req, res) => {
  const recurso = req.body;
  const id = req.params;
  try {
    const updateRecurso = await pool.query(
      `UPDATE recursos SET recurso_tipo= '${recurso.recurso_tipo}', recurso_titulo= '${recurso.recurso_titulo}', 
      recurso_descricao='${recurso.recurso_descricao}', recurso_link='${recurso.recurso_link}', recurso_imagem='${recurso.recurso_imagem}' 
      WHERE recurso_id= (${id.recurso_id})`
    );
    return res.status(200).send({
      message: `Ferramenta updated successfully ${id.recurso_id}`,
      updatedRecurso: updateRecurso.rows[0],
    });
  } catch (err) {
    return res.status(404).send(err);
  }
});

//RECURSOS

app.post("/recursos", isUserLoggedIn, async (req, res) => {
  const user = req.payload;
  const recurso = req.body;

  try {
    const newRecurso = await pool.query(
      `INSERT INTO recursos (recurso_tipo, recurso_titulo, recurso_descricao, recurso_link, recurso_imagem, recurso_online, user_id) 
      VALUES ('recurso', '${recurso.recurso_titulo}', '${recurso.recurso_descricao}', '${recurso.recurso_link}',
      '${recurso.recurso_imagem}', false, ${user.userid})`
    );
    return res.status(200).send(newRecurso.rows);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.put("/recursos/:recurso_id", isAdmin, async (req, res) => {
  const recurso = req.body;
  const id = req.params;
  try {
    const updateRecurso = await pool.query(
      `UPDATE recursos SET recurso_tipo= '${recurso.recurso_tipo}', recurso_titulo= '${recurso.recurso_titulo}', 
      recurso_descricao='${recurso.recurso_descricao}', recurso_link='${recurso.recurso_link}', recurso_imagem='${recurso.recurso_imagem}' 
      WHERE recurso_id= (${id.recurso_id})`
    );
    return res.status(200).send({
      message: `Recurso updated successfully ${id.recurso_id}`,
      updatedRecurso: updateRecurso.rows[0],
    });
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.delete("/recursos/:recurso_id", isAdmin, async (req, res) => {
  const recurso = req.params;
  try {
    const deleteRecurso = await pool.query(
      `DELETE FROM recursos WHERE recurso_id= ${recurso.recurso_id}`
    );
    return res.status(200).send({
      message: "Recurso deleted successfully",
      deletedRecurso: deleteRecurso.rows,
    });
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.get("/recursos", async (req, res) => {
  //console.log('lhe da');

  try {
    const { rows } = await pool.query(
      `SELECT * FROM recursos WHERE recurso_tipo = 'recurso' ORDER BY recurso_id ASC`
    );
    return res.status(200).send(rows);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.get("/recursos/:recurso_id", async (req, res) => {
  const recurso = req.params;
  try {
    const getRecurso = await pool.query(
      `SELECT * FROM recursos WHERE recurso_id= ${recurso.recurso_id} `
    );
    return res.status(200).send(getRecurso.rows[0]);
  } catch (err) {
    return res.status(404).send(err);
  }
});

//PAGINAS

app.post("/paginas", isAdmin, async (req, res) => {
  const pagina = req.body;
  try {
    const newPagina = await pool.query(
      `INSERT INTO paginas (pagina_titulo) VALUES ($1)`,
      [pagina.pagina_titulo]
    );
    return res.status(200).send(newPagina.rows[0]);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.get("/paginas", async (req, res) => {
  //console.log('lhe da');

  try {
    const { rows } = await pool.query(
      `SELECT * FROM paginas ORDER BY paginas_id ASC`
    );
    return res.status(200).send(rows);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.get("/paginas/:pagina_id", isAdmin, async (req, res) => {
  const pagina = req.params;
  try {
    const getPagina = await pool.query(
      "SELECT * FROM paginas WHERE paginas_id= $1",
      [pagina.pagina_id]
    );
    return res.status(200).send(getPagina.rows);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.delete("/paginas/:pagina_id", isAdmin, async (req, res) => {
  const pagina = req.params;
  try {
    const deleteSeccao = await pool.query(
      "DELETE FROM paginas WHERE paginas_id= $1",
      [pagina.pagina_id]
    );
    return res.status(200).send({
      message: "Pagina deleted successfully",
      deletedSeccao: deleteSeccao.rows,
    });
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.put("/paginas/:paginas_id", isAdmin, async (req, res) => {
  const pagina = req.body;
  const id = req.params;
  try {
    const updateSeccao = await pool.query(
      `UPDATE paginas SET pagina_titulo= '${pagina.pagina_titulo}' WHERE paginas_id= (${id.paginas_id})`
    );
    return res.status(200).send({
      message: `Paginas updated successfully ${id.paginas_id}`,
      updatedSeccao: updateSeccao.rows[0],
    });
  } catch (err) {
    return res.status(404).send(err);
  }
});

//SECCOES

app.get("/seccoes", async (req, res) => {
  try {
    const getSeccao = await pool.query(
      "SELECT * FROM seccoes ORDER BY seccao_id ASC"
    );
    return res.status(200).send(getSeccao);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.get("/seccao/:seccao_id", async (req, res) => {
  const id = req.params;
  try {
    const getSeccao = await pool.query(
      `SELECT * FROM seccoes WHERE seccao_id = ${id.seccao_id} `
    );
    return res.status(200).send(getSeccao.rows[0]);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.post("/seccoes/:pagina_id", isAdmin, async (req, res) => {
  const seccao = req.body;
  const pagina = req.params;
  try {
    const newSeccao = await pool.query(
      `INSERT INTO seccoes 
      (seccao_tipo, seccao_titulo, seccao_descricao,
        seccao_imagem, seccao_icone_1, seccao_icone_2, 
        seccao_online, pagina_id, 
        seccao_titulo_en, seccao_descricao_en,
        seccao_legenda_en) 
        VALUES 
        ('${seccao.seccao_tipo}', '${seccao.seccao_titulo}', 
        '${seccao.seccao_descricao}', '${seccao.seccao_imagem}',
        '${seccao.seccao_icone_1}', '${seccao.seccao_icone_2}',
        ${seccao.seccao_online}, ${pagina.pagina_id}, 
        '${seccao.seccao_titulo_en}', '${seccao.seccao_descricao_en}',
        '${seccao.seccao_legenda_en}')`
    );
    return res.status(200).send(newSeccao.rows);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.get("/seccoes/:pagina_id", async (req, res) => {
  const pagina = req.params;
  try {
    const getPagina = await pool.query(
      "SELECT * FROM seccoes WHERE pagina_id= $1 ORDER BY seccao_id ASC",
      [pagina.pagina_id]
    );
    return res.status(200).send(getPagina.rows);
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.delete("/seccoes/:seccao_id", isAdmin, async (req, res) => {
  const seccao = req.params;
  try {
    const deleteSeccao = await pool.query(
      "DELETE FROM seccoes WHERE seccao_id= $1",
      [seccao.seccao_id]
    );
    return res.status(200).send({
      message: "Seccao deleted successfully",
      deletedSeccao: deleteSeccao.rows,
    });
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.put("/seccoes/:seccao_id", isAdmin, async (req, res) => {
  const seccao = req.body;
  const id = req.params;
  try {
    const updateSeccao = await pool.query(
      `UPDATE seccoes SET 
      seccao_tipo = '${seccao.seccao_tipo}', 
      seccao_titulo = '${seccao.seccao_titulo}',
      seccao_descricao = '${seccao.seccao_descricao}',
      seccao_imagem = '${seccao.seccao_imagem}',
      seccao_icone_1 = '${seccao.seccao_icone_1}',
      seccao_icone_2 = '${seccao.seccao_icone_2}',
      seccao_legenda = '${seccao.seccao_legenda}',
      seccao_background_color = '${seccao.seccao_background_color}',
      seccao_online= ${seccao.seccao_online}, 
      pagina_id= ${seccao.pagina_id}, 
      seccao_titulo_en= '${seccao.seccao_titulo_en}',
      seccao_descricao_en= '${seccao.seccao_descricao_en}',
      seccao_legenda_en= '${seccao.seccao_legenda_en}'
      WHERE seccao_id= ${id.seccao_id} `
    );
    return res.status(200).send({
      message: `Seccao updated successfully ${id.seccao_id}`,
      updatedSeccao: updateSeccao.rows[0],
    });
  } catch (err) {
    return res.status(404).send(err);
  }
});

// USERS
app.post("/login", async (req, res) => {
  const user = req.body;
  try {
    const newSession = await pool.query(
      `SELECT * FROM users WHERE user_email = '${user.user_email}' `
    );
    if (newSession) {
      const doesItMatch = await bcrypt.compare(
        user.user_password,
        newSession.rows[0].user_password
      );
      if (doesItMatch) {
        const userData = {
          username: newSession.rows[0].user_name,
          useremail: user.user_email,
          userid: newSession.rows[0].user_id,
          userrole: newSession.rows[0].isadmin,
        };
        const token = jwt.sign(userData, "${process.env.SECRET}");
        res.status(200).cookie("token", token, {sameSite:'none' ,
        domain: 'https://melodic-duckanoo-cafd3f.netlify.app',
        secure: true,
        httpOnly: true}).json(token);
      } else {
        throw "Passwords do not match";
      }
    } else {
      throw "User Does Not Exist";
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.get("/logout", isUserLoggedIn, async (req, res) => {
  res.clearCookie("token").json({ response: "You are Logged Out" });
});

app.post("/signup", async (req, res) => {
  const user = req.body;
  try {
    user.isAdmin = "false";
    const hashed_password = await bcrypt.hash(user.user_password, 10);
    const newSession = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password, isAdmin) VALUES  ($1,$2, $3, $4)",
      [user.user_name, user.user_email, hashed_password, user.isAdmin]
    );
    return res.status(200).send({
      message: `Registo feito ${user.user_name}`,
      newerSession: newSession.rows[0],
    });
  } catch (err) {
    return res.status(404).send(err);
  }
});

app.listen(PORT, () => console.log("listening on port " + PORT));
app.get("/", (req, res) => {
  try {
    res.status(200).send({
      message: "Listening on port " + PORT + "...",
    });
  } catch (err) {
    res.status(404).send(err);
  }
});
