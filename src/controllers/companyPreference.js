const { companyPreferenceServices } = require("../services/companyPreference")
const { productivityPeriodServices } = require("../services/productivityPeriod")

const companyPreferenceController = {
    add: {
        productivity: {
            period: async (req, res, next) => {
                const { companyId, cutoffDayStart, cutoffDayFinish, cutoffInterval } = req.body

                if (!companyId || !cutoffDayStart || !cutoffDayFinish || !cutoffInterval) {
                    return res.status(400).json({ message: "Invalid Parameter" })
                }

                try {
                    await companyPreferenceServices.add.productivity.period(companyId, cutoffDayStart, cutoffDayFinish, cutoffInterval)
                    const data = await productivityPeriodServices.add.automatically(companyId, cutoffDayStart, cutoffDayFinish, cutoffInterval)
                    res.status(200).json({ message: "Productivity preference added successfully", data })
                } catch (error) {
                    res.status(500).json({
                        message: error.message
                    })
                }
            }
        }
    }
}

module.exports = {
    companyPreferenceController
}