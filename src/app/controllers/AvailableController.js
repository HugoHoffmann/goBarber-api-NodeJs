import { startOfDay, endOfDay, setHours, setMinutes, setSeconds, isAfter } from 'date-fns';
import { Op } from 'sequelize';
import Appointments from '../models/Appointments';
import { format } from 'sequelize/types/lib/utils';
class AvailableController{
    async index(req, res){
        const { date } = req.query;

        if(!date) return status(400).json({ error:"Invalid date" });

        const serchDate = Number(date);
        const appointments = await Appointments.findAll({
            where: {
                provider_id: req.params.providerId,
                canceled_at: null, 
                date: {
                    [Op.between]: [startOfDay(serchDate), endOfDay(serchDate)],
                },
            }
        });

        const schedule = [
            '08:00', 
            '09:00', 
            '10:00', 
            '11:00', 
            '12:00', 
            '13:00', 
            '14:00', 
            '15:00', 
            '16:00', 
            '17:00', 
            '18:00', 
            '19:00', 
        ];

        const available = schedule.map(time => {
            const [ hour, minute ] = time.split(':');
            const value = setSeconds(setMinutes(setHours(serchDate, hour), minute), 0);

            return {
                time,
                value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxxx"),
                available: 
                    isAfter(value, new Date()) &&
                    !appointments.find(a =>
                        format(a.date, 'HH:mm') === time    
                    ),
            }
        })

        return res.json(appointments);
    }
}

export default new AvailableController();