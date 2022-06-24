import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

import { fauna } from "../../../services/faunadb"
import { query as q } from "faunadb";


export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        // Info que eu vou querer do usuario
        params: {
          scope: "read:user"
        }
      },
    }),
  ],
  
  callbacks: {// Funcoes q sao executadas automaticamente assim que alguma ação é feita. Quando o user faz login por exemplo

      async signIn({user, account, profile}){

        const { email } = user;

        try{

          // inserção um usuario no banco          
          await fauna.query(
            q.If( // se
              q.Not( // nao
                q.Exists( // existe
                  q.Match(  // onde
                    q.Index("user_by_email"), // email de usuario
                    q.Casefold(email) // email 
                  )
                )
              ),
              // entao
              q.Create(
                q.Collection('users'),
                { data : { email }}
              ),
              // se existe 
              q.Get(
                q.Match(
                  q.Index("user_by_email"),// P buscar informações no fauna deve ser usado index
                  q.Casefold(email)
                )
              )
            ),
            
          )

          return true;
        
        }catch(err){
          return false;
        }
        


        
        

      }
  }
})