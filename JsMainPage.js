class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .header {
                    background-color: #e0e0e0;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 15px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .user-icon {
                    width: 40px;
                    height: 40px;
                    background-color: #0078d7;
                    color: white;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                .hamburger {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    width: 30px;
                    height: 25px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    box-sizing: border-box;
                }

                .hamburger div {
                    width: 30px;
                    height: 3px;
                    background-color: #0078d7;
                    border-radius: 5px;
                }
            </style>
            <div class="header">
                <div class="user-icon">PM</div>
                <button class="hamburger">
                    <div></div>
                    <div></div>
                    <div></div>
                </button>
            </div>
        `;
    }
}

class FooterComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .footer {
                    background-color: #e0e0e0;
                    height: 60px;
                    position: fixed;
                    bottom: 0;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
                }
            </style>
            <div class="footer">
                <p>&copy; 2023 Your Company</p>
            </div>
        `;
    }
}

customElements.define('header-component', HeaderComponent);
customElements.define('footer-component', FooterComponent);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.button-container .button').addEventListener('click', () => {
        window.location.href = 'Timesheets.html';
    });
});
