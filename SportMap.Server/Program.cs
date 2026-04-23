using System.Text;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();
builder.AddRedisOutputCache("redis");
builder.AddNpgsqlDataSource(connectionName: "sportmapdb");

// Add services to the container.
builder.Services.AddProblemDetails();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddDataProtection();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
builder.Services.AddCookiePolicy(options =>
{
    options.MinimumSameSitePolicy = builder.Environment.IsDevelopment()
        ? SameSiteMode.None
        : SameSiteMode.Lax;
   options.Secure = CookieSecurePolicy.SameAsRequest;
});

var secretKey = builder.Configuration["Jwt:SecretKey"]
    ?? throw new InvalidOperationException("Jwt:SecretKey missing");

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme           = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme  = GoogleDefaults.AuthenticationScheme;
        options.DefaultSignInScheme     = "Cookies";
    })
    .AddCookie("Cookies")
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey    = true,
            IssuerSigningKey            = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer              = true,
            ValidIssuer                 = builder.Configuration["Jwt:Issuer"],
            ValidateAudience            = true,
            ValidAudience               = builder.Configuration["Jwt:Audience"],
            ValidateLifetime            = true,
            ClockSkew                   = TimeSpan.FromSeconds(30),
        };
    })
    .AddGoogle(options =>
    {
        var clientId = builder.Configuration["Google:ClientId"];
        var clientSecret = builder.Configuration["Google:ClientSecret"];

        if (!string.IsNullOrEmpty(clientId) && !string.IsNullOrEmpty(clientSecret))
        {
            options.ClientId = clientId;
            options.ClientSecret = clientSecret;
        }
        else
        {
            options.ClientId = "disabled";
            options.ClientSecret = "disabled";
        }
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseOutputCache();
app.UseCors("AllowAll");
app.MapDefaultEndpoints();
app.UseCookiePolicy();
app.UseAuthentication();
app.UseAuthorization();
app.UseFileServer();
app.MapControllers();

app.Run();
