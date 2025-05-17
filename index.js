//minimal api
import express from 'express';
import cors from 'cors';
import receiverofMessages from './sqs_receivemessage.js';

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.urlencoded( {extended: true }))

const port = process.env.PORT || 3000;

let ids = 3

let apuestas = [
  {
    "id" : 1,
    "apuesta_id": 10,
    "monto" : 100
  },
  {
    "id": 2,
    "apuesta_id": 192,
    "monto": 1500
  },
  {
    "id": 3,
    "apuesta_id": 160,
    "monto": 2000
  }
]

app.get('/', (req, res) => {
  res.send('Si funcionas brother')
})


app.get('/apuestas', (req, res) => {
  res.json(apuestas)
})

app.get('/apuestas/:id', (req, res) => {
  const { id } = req.params
  const index = apuestas.findIndex(apuesta => apuesta.id === parseInt(id))
  if(index === -1){
    res.status(404).json({error: "Not fund"})
  } 
  res.json(apuestas[index])
})

app.post('/apuestas', (req, res) => {
  const { apuesta_id, monto, id } = req.body

  if (!id || !apuesta_id || !monto) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }
  
  const apuesta = { id, apuesta_id, monto }
  apuestas.push(apuesta)
  return res.status(201).json(apuesta)
})

app.put('/apuestas/:id', (req, res) => {
  const { monto } = req.body
  const { id } = req.params

  if(!id || !monto){
    res.status(400).json({error: "Faltan datos"})
  }

  const apuestaI = apuestas.findIndex( apuesta => apuesta.id === parseInt(id))
  if(apuestaI === -1){
    res.status(404).json({error: "No encontrado"})
  }

  apuestas[apuestaI].monto = monto

  res.json(apuestas[apuestaI])
  
})

app.delete('/apuestas/:id', (req, res) => {
  const { id } = req.params
  const index = apuestas.findIndex(apuesta => apuesta.id === parseInt(id))
  if(index === -1){
    res.status(404).json({error: "Error"})
  }

  const t = apuestas.splice(index, 1)
  res.json(apuestas)
})


app.listen(port, () => {
  console.log(`API de Ludopatia escucha en el puerto ${port}`)
  receiverofMessages();
})

