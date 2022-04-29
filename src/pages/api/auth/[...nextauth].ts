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
        params: {
          scope: "read:user"
        }
      },
    }),
  ],

  callbacks: {
      async session({session}){

        try{
                      const userActiveSubscription = await fauna.query(
                      q.Get(
                          q.Intersection([ // Ideia de interseção da matematica
                            q.Match(
                              q.Index('subscription_by_user_ref'),
                              q.Select(              
                                "ref",        
                                q.Get(       
                                  q.Match(          
                                    q.Index('user_by_email'),
                                    q.Casefold(session.user.email)
                                  )
                                )
                              )
                            ),
                            q.Match(
                              q.Index('subscription_by_status'),
                              'active'
                            )
                          ])
                      )
                      )
                    
                      return {
                        ...session,
                        activeSubscription: userActiveSubscription
                      }
        }catch (err){
          return {
            ...session,
            activeSubscription: null
          }
        }

        

      }, 
      async signIn({ user, account, profile} ) {     
        try{
          const { email } =  user;    

              await fauna.query(
               q.If( 
                 q.Not(  
                  q.Exists(q.Match(q.Index("user_by_email"), q.Casefold(email)))
                  ),
                  q.Create( 
                    q.Collection('users'), 
                    { data: { email } }                       
                  ), // abaixo teriamos algo equivalente ao else
                  q.Get( 
                    q.Match(
                      q.Index('user_by_email'), 
                      q.Casefold(user.email)
                    )
                  )
                )
                
              )
          
              return true;
        }
        catch(err){
          console.log("ESSE EH O ERRO", err);
          console.log("ERRO ESTA ACIMA")
          return false
        }
      },
  }
})