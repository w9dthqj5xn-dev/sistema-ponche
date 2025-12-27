import bcrypt from 'bcryptjs';

const password = 'admin123';
const hash = '$2a$10$zDYVd7ImYbA39xbwePixwuhHCRYZUwPdODqDiENeqAAn0Xy4yCBAi';

console.log('Testing password:', password);
console.log('Against hash:', hash);

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password matches:', result);
  }
  
  // Also generate a fresh hash to compare
  bcrypt.hash(password, 10, (err, newHash) => {
    console.log('\nNew hash generated:', newHash);
    bcrypt.compare(password, newHash, (err, result2) => {
      console.log('New hash matches:', result2);
      process.exit(0);
    });
  });
});
