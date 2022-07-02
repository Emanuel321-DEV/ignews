import { mocked } from 'jest-mock';
import { useSession } from 'next-auth/react';
import { SigninButton } from './index'

import { render, screen } from "@testing-library/react"

jest.mock("next-auth/react");

describe("SigninButton component", () => {
    
    it("Should renders text: Sign with Github, when user NOT is logged", () => {
        const useSessionMocked = mocked(useSession)
        
        useSessionMocked.mockReturnValueOnce({ data: null, status: "loading" });
                
        render(
            <SigninButton />
        )

        expect( screen.getByText("Sign with Github") ).toBeInTheDocument();

    })

    it("Should renders the name of user, when user is logged", () => {
        const useSessionMocked = mocked(useSession)
        
        useSessionMocked.mockReturnValueOnce({
            data: {
              user: { name: "John Doe", email: "john.doe@example.com" },
              expires: "fake-expires",
            },
            status: "authenticated",
          });
        
        render(
            <SigninButton />
        )

        expect( screen.getByText("John Doe") ).toBeInTheDocument();

    })

})
