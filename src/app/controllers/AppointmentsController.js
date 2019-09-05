import Appointments from '../models/Appointments';
import User from '../models/User';
import * as Yup from 'yup';

class AppointmentsController{
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

        const appointments = await Appointments.create({
            user_id: req.userId,
            provider_id,
            date
        })

        return res.status(200).json(appointments);
    }
}
export default new AppointmentsController();