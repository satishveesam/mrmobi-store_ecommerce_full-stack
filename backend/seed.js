const fs = require('fs');

const categories = [
  'Mobiles', 'Audio', 'Watches', 'Accessories', 'Computers', 
  'Cameras', 'Gaming', 'Toys', 'Food', 'Drones'
];

let sql = '';

const getPrice = () => {
    const originalPrice = Math.floor(Math.random() * 50000) + 1000;
    const discountPercentage = Math.floor(Math.random() * 30);
    const discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);
    return { originalPrice, discountPercentage, discountedPrice };
};

const getImages = (cat) => {
    const imgs = {
        'Mobiles': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
        'Audio': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
        'Watches': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80',
        'Accessories': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80',
        'Computers': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
        'Cameras': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
        'Gaming': 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=600&q=80',
        'Toys': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80',
        'Food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
        'Drones': 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=600&q=80'
    };
    return imgs[cat] || imgs['Mobiles'];
};

for (const cat of categories) {
    for (let i = 1; i <= 10; i++) {
        const name = `Premium ${cat} Item ${i}`;
        const desc = `High quality ${cat} product for your everyday needs. Discover the best in class features and design.`;
        const { originalPrice, discountPercentage, discountedPrice } = getPrice();
        const stock = Math.floor(Math.random() * 100) + 10;
        const img = getImages(cat);
        
        sql += `INSERT INTO product (name, description, original_price, discount_percentage, discounted_price, stock, category, image_url) VALUES ('${name}', '${desc}', ${originalPrice}, ${discountPercentage}, ${discountedPrice}, ${stock}, '${cat}', '${img}');\n`;
    }
}

fs.writeFileSync('seed.sql', sql);
console.log('seed.sql generated successfully.');
