import { createClient } from '@supabase/supabase-js';
import yup from "yup";
import bcrypt from "bcrypt";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function updatePassword(req, res) {
    const schema = yup.object().shape({
        id: yup.string().required(),
        senha: yup.string().required(),
    });
    try {
        const { id, senha } = req.body;
        await schema.validate({ id, senha });
        const hashedPassword = await bcrypt.hash(senha, 10);
        const { data, error } = await supabase
            .from('funcionarios')
            .update({ senha: hashedPassword })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            return res.status(500).json({ message: 'Erro ao atualizar senha', error: error.message });
        }
        return res.status(200).json({ message: 'Senha atualizada com sucesso', user: { id: data.id, nome: data.nome } });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}
