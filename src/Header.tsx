/* eslint-disable */
import React from 'react'

interface HeaderProps {
  title: string;
  type?: string;
}
const Header: React.FC<HeaderProps> = ({ title }: HeaderProps) => (
  // const [counter, setCounter] = useState(0) // [valor do estado, função para atualizar o valor]

  <header>
    <h1>{title}</h1>
  </header>
)

export default Header
