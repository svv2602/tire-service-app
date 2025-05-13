// Service Points Debug Helper
// Load this script in the console to help debug services and service points

(function() {
    console.log('============= Service Points Debug Helper =============');
    
    // Check if we're in React environment
    if (!window.React) {
        console.error('React not detected. Make sure you are running this in the web frontend.');
        return;
    }
    
    // Helper functions
    async function fetchServices() {
        console.log('Fetching services...');
        try {
            const response = await fetch('http://localhost:8000/api/services');
            const data = await response.json();
            
            if (data.status === 'success' && Array.isArray(data.data)) {
                console.log(`Found ${data.data.length} services:`, data.data);
                return data.data;
            } else {
                console.error('Unexpected API response format:', data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            return [];
        }
    }
    
    async function fetchServicePoints() {
        console.log('Fetching service points...');
        try {
            const response = await fetch('http://localhost:8000/api/service-points');
            const data = await response.json();
            
            if (data.status === 'success' && Array.isArray(data.data)) {
                console.log(`Found ${data.data.length} service points:`, data.data);
                return data.data;
            } else {
                console.error('Unexpected API response format:', data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching service points:', error);
            return [];
        }
    }
    
    // Inspect Redux store if available
    function inspectReduxStore() {
        if (window.__REDUX_DEVTOOLS_EXTENSION__) {
            console.log('Redux DevTools detected. You can inspect the Redux store there.');
        }
        
        // Attempt to find Redux store
        let reduxStore = null;
        
        // Try common store variable names
        if (window.store) {
            reduxStore = window.store;
        } else if (window.__store) {
            reduxStore = window.__store;
        } else if (window.reduxStore) {
            reduxStore = window.reduxStore;
        }
        
        if (reduxStore) {
            const state = reduxStore.getState();
            console.log('Redux store state:', state);
            
            if (state.services) {
                console.log('Services in Redux store:', state.services.items);
            }
            
            if (state.servicePoints) {
                console.log('Service points in Redux store:', state.servicePoints.items);
            }
        } else {
            console.log('Redux store not found. Cannot inspect state directly.');
        }
    }
    
    // Main debug function
    async function runDebug() {
        // 1. Check API endpoints
        const services = await fetchServices();
        const servicePoints = await fetchServicePoints();
        
        // 2. Inspect Redux store
        inspectReduxStore();
        
        // 3. Find service selector component in DOM
        console.log('Looking for service selector component in DOM...');
        const potentialSelectors = Array.from(document.querySelectorAll('select')).filter(select => 
            select.id === 'add-service' || 
            select.getAttribute('aria-labelledby')?.includes('service') ||
            select.labels?.length > 0 && Array.from(select.labels).some(label => label.textContent.includes('услуг'))
        );
        
        if (potentialSelectors.length > 0) {
            console.log('Potential service selectors found:', potentialSelectors);
        } else {
            console.log('No service selector found in DOM. The component might not be rendered yet.');
        }
        
        // 4. Setup a patch
        window.fixServiceSelector = function() {
            console.log('Attempting to fix service selector...');
            
            // Try to find the service selector component
            const select = document.querySelector('select#add-service');
            if (!select) {
                console.error('Service selector not found.');
                return;
            }
            
            // Create options for each service if missing
            if (select.options.length <= 1) {
                console.log('Adding options to service selector...');
                
                services.forEach(service => {
                    const option = document.createElement('option');
                    option.value = service.id;
                    option.textContent = service.name;
                    select.appendChild(option);
                });
                
                console.log('Added options to service selector');
            }
            
            console.log('Service selector fix complete');
        };
        
        console.log('\nTo fix service selector, run: window.fixServiceSelector()');
    }
    
    // Run debug
    runDebug();
    
    console.log('============= End Debug Helper =============');
})(); 