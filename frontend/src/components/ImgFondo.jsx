import React from "react";

function ImgFondo({children}) {
    return(
        <section className="w-full h-full bg-cover bg-center flex justify-center absolute inset-0">
            {children}
        </section>
    );
}

export default ImgFondo;