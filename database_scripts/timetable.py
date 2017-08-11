
#!/usr/bin/python
import pymysql
import pandas as pd
from database import database_setup



db = database_setup("password.txt", "eta.cb0ofqejduea.eu-west-1.rds.amazonaws.com", "3306", "eta", "eta")
connectDB = db.db_engine()

def create_table():
    
    sql_0 = """
    DROP TABLE IF EXISTS timetables
    """
    
    sql_1="""
    CREATE TABLE IF NOT EXISTS timetables ( journey_pattern CHAR(8), first_stop INT(4),  last_stop INT(4), day_category CHAR(12), departure_time TIME, line CHAR(4) )
    """
    connectDB.execute(sql_0)
    connectDB.execute(sql_1)
    
create_table()

df = pd.read_csv('time_table.csv', encoding='latin1',dtype={'journey_pattern': object})
print(df.head())
print("Read csv file")
df.to_sql(name='timetables', con=connectDB, if_exists='append', index=False)
print("Finish the insert of table")

