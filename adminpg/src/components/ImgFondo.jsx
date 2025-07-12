import React from "react";

function ImgFondo({children}) {
    return(
        <section className="w-auto h-150 bg-cover bg-center flex justify-center items-center relative">
            {children}
        </section>
    );
}

export default ImgFondo;