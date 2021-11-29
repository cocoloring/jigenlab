interface DemoComponentProps {
    name?: React.Component
}

const DemoComponent: React.FC<DemoComponentProps> = (props) => {
    const name = props.name ?? 'World'
    return <span>Hello, {name}!</span>
}

export default DemoComponent