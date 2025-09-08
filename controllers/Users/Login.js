import { createClient } from '@supabase/supabase-js';
import yup from "yup";
import chalk from "chalk";
import bcrypt from "bcrypt";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Validação do schema de login
const loginSchema = yup.object().shape({
    nome: yup.string(),
    password: yup.string(),
    token: yup.string(),
});

// Rota de login
export async function loginUser(req, res) {
    const { nome, password, token } = req.body;
    try {
        // Valida os dados recebidos
        await loginSchema.validate({ nome, password, token });

        let user = null;
        // Login por token
        if (token) {
            const { data, error } = await supabase
                .from('funcionarios')
                .select('*')
                .eq('token', token)
                .single();
            if (error || !data) {
                return res.status(401).json({ message: "Token inválido" });
            }
            user = data;
        } else if (nome && password) {
            // Login por nome e senha
            const { data, error } = await supabase
                .from('funcionarios')
                .select('*')
                .eq('nome', nome)
                .single();
            if (error || !data) {
                return res.status(401).json({ message: "Credenciais inválidas" });
            }
            // Se não existir campo de senha, remova a validação de senha
                const isPasswordValid = await bcrypt.compare(password, data.password);
                if (!isPasswordValid) {
                    return res.status(401).json({ message: "Credenciais inválidas" });
                }
            user = data;
        } else {
            return res.status(400).json({ message: "Informe nome e senha ou token" });
        }

        if (!user.ativo) {
            return res.status(403).json({ message: "Usuário inativo" });
        }

        console.log(chalk.green(`Sistema 💻 : Login bem-sucedido: ${user.id}`));

        return res.status(200).json({
            message: "Login bem-sucedido ✅",
            userId: user.id,
            cargo: user.cargo,
            nome: user.nome,
        });
    } catch (error) {
        console.log(chalk.red(`Sistema 💻 : Erro ao fazer login: ${error.message} ❌`));
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
}
