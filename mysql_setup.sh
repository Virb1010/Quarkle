# #!/bin/bash

DATABASE_DUMP_FILE="plume.sql"
USERNAME="root"
PASSWORD="quarkle2024"
DATABASE="plume"

# Install MySQL using Homebrew
echo "Installing MySQL..."
brew install mysql

# Start MySQL service
echo "Starting MySQL..."
brew services start mysql

# Wait for MySQL to start up completely
sleep 10

# Secure MySQL installation non-interactively
echo "Securing MySQL installation..."
SECURE_MYSQL=$(expect -c "
set timeout 10
spawn mysql_secure_installation

expect \"Enter password for user root:\"
send \"$PASSWORD\r\"

expect \"Press y|Y for Yes, any other key for No:\"
send \"y\r\"

expect \"New password:\"
send \"$PASSWORD\r\"

expect \"Re-enter new password:\"
send \"$PASSWORD\r\"

expect \"Remove anonymous users? (Press y|Y for Yes, any other key for No) :\"
send \"y\r\"

expect \"Disallow root login remotely? (Press y|Y for Yes, any other key for No) :\"
send \"y\r\"

expect \"Remove test database and access to it? (Press y|Y for Yes, any other key for No) :\"
send \"y\r\"

expect \"Reload privilege tables now? (Press y|Y for Yes, any other key for No) :\"
send \"y\r\"

expect eof
")

echo "$SECURE_MYSQL"

# Create the database and configure the user
echo "Creating the $DATABASE database and setting up the user..."
mysql -u $USERNAME -p$PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DATABASE;"

# Create the user and set password (remove if the user is already 'root' or exists)
mysql -u $USERNAME -p$PASSWORD -e "CREATE USER IF NOT EXISTS '$USERNAME'@'localhost' IDENTIFIED BY '$PASSWORD';"

# Grant privileges
mysql -u $USERNAME -p$PASSWORD -e "GRANT ALL PRIVILEGES ON $DATABASE.* TO '$USERNAME'@'localhost';"

# Flush privileges to ensure that grants are applied
mysql -u $USERNAME -p$PASSWORD -e "FLUSH PRIVILEGES;"

# Import database schema
echo "Importing the database schema..."
mysql -u $USERNAME -p$PASSWORD $DATABASE < $DATABASE_DUMP_FILE

# Export environment variables for MySQL client library
echo "Setting up environment variables for MySQL client..."
export MYSQLCLIENT_CFLAGS=$(mysql_config --cflags)
export MYSQLCLIENT_LDFLAGS=$(mysql_config --libs)

# Add environment variable exports to .bash_profile to persist them
echo 'export MYSQLCLIENT_CFLAGS=$(mysql_config --cflags)' >> ~/.bash_profile
echo 'export MYSQLCLIENT_LDFLAGS=$(mysql_config --libs)' >> ~/.bash_profile

echo "MySQL setup is complete."