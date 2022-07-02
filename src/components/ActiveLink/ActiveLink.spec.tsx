// renderiza um elemento virtualmente
import { render, screen } from "@testing-library/react";

import { ActiveLink } from ".";

// Cria uma imitação/simulação do useRouter, pois o Active link depende dessa função
jest.mock("next/router", () => {
    return {
        useRouter(){
            return {
                asPath: '/'
            }
        }
    }
})

describe("Active Link component", () => {

    it("Active link renders correctly", () => {
        const { getByText } = render(
            <ActiveLink href="/" activeClassName="active">
                <a>Home</a>
            </ActiveLink>
        )
    
        expect(getByText('Home')).toBeInTheDocument()
    
    })

    it("adds active class if the link as currently active", () => {
        render(
            <ActiveLink href="/" activeClassName="active">
                <a>Home</a>
            </ActiveLink>
        )
    
        expect(screen.getByText('Home')).toHaveClass('active')
    
    })

})

