import { DashboardService } from '../services/dashboard.service.js'

export class DashboardController {
    static async getSummaryStats(req, res) {
        try {
            const data = await DashboardService.getSummaryStats(req.user)
            res.json(data)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
}
