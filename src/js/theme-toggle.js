document.addEventListener('DOMContentLoaded', (event) => {
    const systemDefaultBtn = document.getElementById('system-default');
    const lightModeBtn = document.getElementById('light-mode');
    const darkModeBtn = document.getElementById('dark-mode');

    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : 'system-default';
    
    const applyTheme = (theme) => {
        document.body.classList.remove('light-mode', 'dark-mode');
        
        if (theme === 'dark-mode') {
            document.body.classList.add('dark-mode');
            window.renderer.setClearColor(0x1e1e1e); // Dark background color
        } else if (theme === 'light-mode') {
            document.body.classList.add('light-mode');
            window.renderer.setClearColor(0xf0f0f0); // Light background color
        } else {
            // Use system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-mode');
                window.renderer.setClearColor(0x1e1e1e); // Dark background color
            } else {
                window.renderer.setClearColor(0xf0f0f0); // Light background color
            }
        }
        
        localStorage.setItem('theme', theme);
    }

    const activateButton = (button) => {
        document.querySelectorAll('.toggle-option').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    }

    if (currentTheme) {
        applyTheme(currentTheme);

        if (currentTheme === 'dark-mode') {
            activateButton(darkModeBtn);
        } else if (currentTheme === 'light-mode') {
            activateButton(lightModeBtn);
        } else {
            activateButton(systemDefaultBtn);
        }
    }

    systemDefaultBtn.addEventListener('click', () => {
        applyTheme('system-default');
        activateButton(systemDefaultBtn);
    });

    lightModeBtn.addEventListener('click', () => {
        applyTheme('light-mode');
        activateButton(lightModeBtn);
    });

    darkModeBtn.addEventListener('click', () => {
        applyTheme('dark-mode');
        activateButton(darkModeBtn);
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === 'system-default') {
            applyTheme('system-default');
        }
    });
});
