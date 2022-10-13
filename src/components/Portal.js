
import { createPortal } from "react-dom"

const Portal=({parent,children})=>{

const root=parent || document.getElementById('root')


    return(
        <>
        {createPortal()}
        </>
    )
}