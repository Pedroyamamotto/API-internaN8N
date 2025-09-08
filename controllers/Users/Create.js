import { createClient } from '@supabase/supabase-js';
import yup from "yup";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Validação do schema de criação
const createUserSchema = yup.object().shape({
    nome: yup.string().required(),
    senha: yup.string().required(),
    cargo: yup.string().required(),
    ativo: yup.boolean().default(true),
});

export async function createUser(req, res) {
    try {
        const { nome, senha, cargo, ativo } = req.body;
        await createUserSchema.validate({ nome, senha, cargo, ativo });

        // Verifica se já existe usuário com o mesmo nome
        const { data: existing, error: findError } = await supabase
            .from('funcionarios')
            .select('id')
            .eq('nome', nome)
            .single();
        if (existing) {
            return res.status(409).json({ message: 'Usuário já existe' });
        }

        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(senha, 10);
        const token = uuidv4();
        const criado_em = new Date().toISOString();

        // Insere o novo usuário
        const { data, error } = await supabase
            .from('funcionarios')
            .insert([
                {
                    nome,
                    senha: hashedPassword,
                    cargo,
                    ativo: ativo !== undefined ? ativo : true,
                    token,
                    criado_em,
                },
            ])
            .select()
            .single();

        if (error) {
            return res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
        }

        return res.status(201).json({
            message: 'Usuário criado com sucesso',
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
