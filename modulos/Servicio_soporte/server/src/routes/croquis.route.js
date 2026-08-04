import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { CroquisModel } from '../models/croquis.model.js'

import { Jimp } from 'jimp'

const router = Router()

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Asegurar que la carpeta de subidas exista
const uploadDir = path.join(__dirname, '../../public/uploads')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

// Configurar multer en memoria
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|svg|webp/
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = filetypes.test(file.mimetype)

        if (mimetype && extname) {
            return cb(null, true)
        } else {
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, svg, webp)'))
        }
    }
})

// Subir o actualizar croquis de un piso (procesado con jimp y guardado como webp)
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        const { piso_id } = req.body
        if (!piso_id) {
            return res.status(400).json({ error: 'El piso_id es requerido' })
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Debe subir un archivo de imagen (croquis)' })
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const filename = `${uniqueSuffix}.webp`
        const destPath = path.join(uploadDir, filename)

        // Convertir y comprimir con jimp a webp
        const image = await Jimp.read(req.file.buffer)
        await image.quality(80).writeAsync(destPath)

        const imagen_url = `/uploads/${filename}`
        
        // Si ya existía un croquis para este piso, intentamos borrar el archivo físico anterior
        const croquisExistente = await CroquisModel.getByPisoId(piso_id)
        if (croquisExistente) {
            const oldPath = path.join(__dirname, '../../public', croquisExistente.imagen_url)
            if (fs.existsSync(oldPath)) {
                try {
                    fs.unlinkSync(oldPath)
                } catch (err) {
                    console.error('No se pudo borrar la imagen anterior:', err)
                }
            }
        }

        const croquis = await CroquisModel.createOrUpdate({
            piso_id: parseInt(piso_id),
            imagen_url
        })

        res.status(201).json({ success: true, data: croquis })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message || 'Error al guardar croquis' })
    }
})

// Obtener croquis por piso_id
router.get('/piso/:pisoId', async (req, res) => {
    try {
        const { pisoId } = req.params
        const croquis = await CroquisModel.getByPisoId(pisoId)
        res.json(croquis)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

// Eliminar croquis
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const croquis = await CroquisModel.getById(id)
        if (!croquis) {
            return res.status(404).json({ error: 'Croquis no encontrado' })
        }

        // Eliminar archivo físico
        const filePath = path.join(__dirname, '../../public', croquis.imagen_url)
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath)
            } catch (err) {
                console.error('No se pudo eliminar el archivo físico:', err)
            }
        }

        await CroquisModel.delete(id)
        res.json({ success: true, message: 'Croquis eliminado' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

export default router
