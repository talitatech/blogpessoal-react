/* eslint-disable @typescript-eslint/no-wrapper-object-types, @typescript-eslint/no-unsafe-function-type */
import axios from "axios";

const api = axios.create({
    baseURL: 'https://blogpessoal-spring-backend.onrender.com'
})

export const cadastrarUsuario = async (url: string, dados: Object, setDados: Function) => {
    const resposta = await api.post(url, dados)
    setDados(resposta.data)
}

export const login = async (url: string, dados: Object, setDados: Function) => {
    const resposta = await api.post(url, dados)
    setDados(resposta.data)
}
