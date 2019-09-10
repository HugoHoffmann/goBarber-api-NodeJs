import format from 'date-fns';
import pt from 'date-fns/locale/pt'
import Mail from '../../lib/Mail';

class CancellationMail{
    get key(){
        return 'CancellationMail';
    }
    async handle({ data }){
        const { appointment } = data;

        Mail.SendMail({
            to: `${appointment.provider.name} <${appointment.provider.email}>}`,
            subject: `Agendamento Cancelado`,
            template: 'cancellation',
            context: {
                provider: appointment.provider.name,
                user: appointment.user.name,
                date: format( appointment.date, " 'dia' dd 'de' MMMM', às' H:mm'h'",
                    { locale: pt }  
                ),
            }
        });
    }
}

export default new CancellationMail();