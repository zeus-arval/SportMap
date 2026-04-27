using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using SportMap.DAL.DataContext;

namespace SportMap.DAL.DataAccess
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var config = new ConfigurationBuilder()
                .AddUserSecrets("d150b327-b015-49c0-b7c4-94155aeaeb40")
                .Build();

            var user = config["Parameters:postgres-username"];
            var pass = config["Parameters:postgres-password"];

            var connectionString =
                $"Host=localhost;Port=5432;Database=sportmapdb;Username={user};Password={pass}";

            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseNpgsql(connectionString)
                .Options;

            return new AppDbContext(options);
        }
    }
}