import Appointments from '../models/Appointments';
import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import Mail from '../../lib/Mail'

class AppointmentsController{
    async index(req, res){
        const { page = 1 } = req.query;
        const appointments = await Appointments.findAll({
            where: { user_id: req.userId, canceled_at: null },
            order: [
                'date'
            ],
            attributes: ['id', 'date'],
            limit: 20,
            offset: (page - 1) * 20,
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['id', 'name'],
                    include:[
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['id', 'path', 'url'],
                        }
                    ]
                },
            ]
        });

        return res.json(appointments);
    }

    async store(req, res){
        const schema = Yup.object().shape({
            date: Yup.date().required(),
            provider_id: Yup.number().required()
        });

        if(! (await schema.isValid(req.body)) ) return res.status(400).json({ erros: "Validation fails" })

        const { provider_id, date } = req.body;

        /**
         * 
         * Check if provider_id is a provider
         */
        const isProvider = await User.findOne({ 
            where: { id: provider_id, provider: true } 
        });

        if(!isProvider) return res.status(401).json({ error: "You can only create appointments with providers" });

        /**
         * check for past dates
         */
        const hourStart = startOfHour(parseISO(date));
        if(isBefore(hourStart, new Date())){
             return res.status(400).json({ error: "Past dates are not permitted" })
        }

        /**
         * check date availability
         */
        const checkAvailability = await Appointments.findOne({
            where: {
                provider_id,
                canceled_at: null,
                date: hourStart
            }
        });

        if(checkAvailability) return res.status(400).json({ error: "Appointment date is not available" });

        const appointments = await Appointments.create({
            user_id: req.userId,
            provider_id,
            date
        });

        /**
         * Notify provider
         */
        const user = await User.findByPk(req.userId);
        const formattedDate = format(
            hourStart, 
            " 'dia' dd 'de' MMMM', às' H:mm'h'",
            { locale: pt }  
        ); 
        await Notification.create({
            content: `Novo agendamento de ${user.name} para ${formattedDate} `,
            user: provider_id,
        });

        return res.status(200).json(appointments);
    }

    async delete(req, res){
        const appointment = Appointments.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'provider',
                    attributes: ['id', 'name', 'email']
                }
            ],
        });
        if(appointment.id !== req.userId){
            return res.status(401).json({error: "You don't have permission to cancel this appointment!"})
        }
        const dateWithSub = subHours(appointment.date, 2);
        if(isBefore(dateWithSub, new Date())){
            return res.status(401).json({ error: "You can only cancel appointments 2 hours in advance."});
        }
        appointment.canceled_at = new Date();
        await appointment.save();

        await Mail.SendMail({
            to: `${appointment.provider.name} <${appointment.provider.email}>}`,
            subject: `Agendamento Cancelado`,
            text: 'você tem um novo cancelamento.'

        });

        return res.json(appointment);
    }
}
export default new AppointmentsController();