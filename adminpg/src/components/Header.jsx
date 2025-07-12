import React from "react";
import Logo from "./Logo";
import ItemNav from "./ItemNav";
import SectionHeader from "./SectionHeader";

function Header(){
    return(
        <SectionHeader>
                <div className="ml-2">
                    <Logo/>
                </div>

                <div className="mr-2">
                    <ul className="list-none flex gap-4">
                        <ItemNav item="Registrate" />
                        <ItemNav item="Inicia sesion" />
                    </ul>
                </div>
        </SectionHeader>
    );
}

export default Header;