
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Define a função para verificar o tamanho da tela
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Chama a verificação imediatamente
    checkMobile()
    
    // Configura o event listener para mudanças de tamanho da tela
    window.addEventListener("resize", checkMobile)
    
    // Limpa o event listener quando o componente é desmontado
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}
