import { jwtDecode } from "jwt-decode";

export const verificaTokenExpirado =
    (token: string | undefined) => {
        if (token) {
            const decodedToken = jwtDecode(token)

            if (
                !decodedToken.exp
                ||
                decodedToken.exp < new Date().getTime() / 1000
            ) {

                // token expirado
                return true

            }
            //tudo ok
            return false
        }
        //nao tem token
        return true

    }
