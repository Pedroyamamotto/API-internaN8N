import { createClient } from '@supabase/supabase-js';
import yup from "yup";
import bcrypt from "bcrypt";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Validação do schema de atualização
const updateUserSchema = yup.object().shape({
    id: yup.string().required(),
    nome: yup.string(),
    senha: yup.string(),
    cargo: yup.string(),
    ativo: yup.boolean(),
});

export async function updateUser(req, res) {
    try {
        const { id, nome, senha, cargo, ativo } = req.body;
        await updateUserSchema.validate({ id, nome, senha, cargo, ativo });

        // Monta objeto de atualização
        const updateData = {};
        if (nome !== undefined) updateData.nome = nome;
        if (cargo !== undefined) updateData.cargo = cargo;
        if (ativo !== undefined) updateData.ativo = ativo;
        if (senha !== undefined) {
            updateData.senha = await bcrypt.hash(senha, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'Nenhum campo para atualizar' });
        }

        const { data, error } = await supabase
            .from('funcionarios')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
        }

        return res.status(200).json({
            message: 'Usuário atualizado com sucesso',
            user: {
                id: data.id,
                nome: data.nome,
                cargo: data.cargo,
                ativo: data.ativo,
                token: data.token,
                criado_em: data.criado_em,
            },
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}
