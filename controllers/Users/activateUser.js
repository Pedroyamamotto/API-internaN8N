import { createClient } from '@supabase/supabase-js';
import yup from "yup";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function activateUser(req, res) {
    const schema = yup.object().shape({
        id: yup.string().required(),
    });
    try {
        const { id } = req.body;
        await schema.validate({ id });
        const { data, error } = await supabase
            .from('funcionarios')
            .update({ ativo: true })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            return res.status(500).json({ message: 'Erro ao ativar usuário', error: error.message });
        }
        return res.status(200).json({ message: 'Usuário ativado com sucesso', user: { id: data.id, nome: data.nome, ativo: data.ativo } });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}
