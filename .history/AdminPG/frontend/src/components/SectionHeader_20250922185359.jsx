import React from "react";

function SectionHeader({children}){
    return(
        <header className="w-full h-20 bg-white justify-between items-center flex p-4 relative z-20">
            {children}
        </header>
    );
}

export default SectionHeader;