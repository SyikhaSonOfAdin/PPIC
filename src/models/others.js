const QUERY = {
    select: {
        distinct: {
            period: {
                year: `SELECT DISTINCT PERIOD_YEAR 
                        FROM project_plans AS PP
                        JOIN company_projects AS CP ON CP.ID = PP.PROJECT_ID
                        WHERE CP.COMPANY_ID = ?
                        UNION
                        SELECT DISTINCT PERIOD_YEAR 
                        FROM project_actual AS PA
                        JOIN company_projects AS CP ON CP.ID = PA.PROJECT_ID
                        WHERE CP.COMPANY_ID = ? ORDER BY PERIOD_YEAR DESC`
            }
        }
    }
}

module.exports = {
    othersQuerys: QUERY
}