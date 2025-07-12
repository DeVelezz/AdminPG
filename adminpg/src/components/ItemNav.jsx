import React from "react";

function ItemNav(props) {
    return (
        <li className="font-medium hover:text-blue-600 hover:underline ease-in-out duration-300">
            <a href="">{props.item}</a>
        </li>

    );
}

export default ItemNav;