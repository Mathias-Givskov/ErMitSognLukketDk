using AngleSharp;
using ermitsognnedeFunctions.Services.Interfaces;
using Flurl.Http;
using Flurl.Http.Configuration;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Threading.Tasks;

namespace ermitsognnedeFunctions.Services
{
    public class CovidDataClient : ICovidDataClient
    {
        private static class BaseUrls
        {
            public const string Covid19SsiBaseUrl = "https://covid19.ssi.dk";
            public const string Covid19SsiFilesBaseUrl = "https://files.ssi.dk";
        }

        public async Task<Stream> GetInfectionLevelsOnDistrictLevelAsync()
        {
            var config = Configuration.Default.WithDefaultLoader();
            var address = $"{BaseUrls.Covid19SsiBaseUrl}/overvagningsdata/opgoerelser-over-covid-19-incidenser-og-vaekstrater";
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(address);
            var linkWithDataSelector = "a[href^='https://files.ssi.dk/covid19/incidenser-vaekstrater/smitteniveau-kommuner-sogne/smitteniveau-kommuner-sogne-covid19']";
            var downloadDataLinkElement = document.QuerySelector(linkWithDataSelector);

            var downloadDataLinkUrl = downloadDataLinkElement.GetAttribute("href");
            return await Request(BaseUrls.Covid19SsiFilesBaseUrl, downloadDataLinkUrl.Replace(BaseUrls.Covid19SsiFilesBaseUrl, string.Empty), req => req.GetStreamAsync());
        }

        private async Task<TResult> Request<TResult>(string baseUrl, string path, Func<IFlurlRequest, Task<TResult>> func)
        {
            var result = default(TResult);

            
            try
            {
                var request = new FlurlRequest(baseUrl + path)
                    .ConfigureRequest(x =>
                        {
                            var jsonSettings = new JsonSerializerSettings
                            {
                                NullValueHandling = NullValueHandling.Ignore,
                                DefaultValueHandling = DefaultValueHandling.Include,
                                MissingMemberHandling = MissingMemberHandling.Ignore
                            };
                            x.JsonSerializer = new NewtonsoftJsonSerializer(jsonSettings);
                        });

                return await func.Invoke(request);
            }
            catch (FlurlHttpException ex)
            {
                throw;
            }

            return await Task.FromResult(result);
        }
    }
}
