using CsvHelper;
using CsvHelper.Configuration;
using ermitsognnedeFunctions.Mappers;
using ermitsognnedeFunctions.Models;
using ermitsognnedeFunctions.Services.Interfaces;
using NPOI.SS.UserModel;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;

namespace ermitsognnedeFunctions.Services
{
    public class DistictService : IDistictService
    {
        public List<DistrictDataJsonModel> GetDistrictDataJsonModels(FileModel fileModel)
        {
            var fileExtension = Path.GetExtension(fileModel.FileName);
            switch (fileExtension.ToLower())
            {
                case ".csv":
                    return GetFromCsvFile(fileModel);

                case ".xlsx":
                case ".xls":
                    return GetFromExcelFile(fileModel);
            }

            return null;
        }

        private List<DistrictDataJsonModel> GetFromCsvFile(FileModel fileModel)
        {
            var results = new List<DistrictDataJsonModel>();

            var csvConfig = new CsvConfiguration(new CultureInfo("da-DK", false))
            {
                Delimiter = ";"
            };

            fileModel.Stream.Seek(0, SeekOrigin.Begin);
            using (var reader = new StreamReader(fileModel.Stream))
            using (var csvStream = new CsvReader(reader, csvConfig))
            {
                csvStream.Context.RegisterClassMap<DistrictDataCsvModelMapper>();
                var csvModels = csvStream.GetRecords<DistrictDataCsvModel>();
                if (csvModels == null)
                    return null;

                foreach (var csvModel in csvModels)
                {
                    if (csvModel == null)
                        continue;

                    var StartOfLatestAutomaticShutdownDate = csvModel.StartOfLatestAutomaticShutdown.ToLower() != "NA" && DateTime.TryParse(csvModel.StartOfLatestAutomaticShutdown, out var dateValue)
                        ? dateValue
                        : default(DateTime?);

                    results.Add(new DistrictDataJsonModel
                    {
                        District = csvModel.District,
                        DistrictCode = csvModel.DistrictCode,
                        DistrictPopulationCount = csvModel.DistrictPopulationCount,
                        Incidence = csvModel.Incidence,
                        IsClosed = csvModel.StatusForAutomaticClosing.ToLower() == "nedlukket",
                        Municipality = csvModel.Municipality,
                        NewInfectedCount = csvModel.NewInfectedCount,
                        PositivePercentage = csvModel.PositivePercentage,
                        StartOfLatestAutomaticShutdown = StartOfLatestAutomaticShutdownDate
                    });
                }
            }

            return results;
        }

        private List<DistrictDataJsonModel> GetFromExcelFile(FileModel fileModel)
        {
            var workbook = WorkbookFactory.Create(fileModel.Stream);
            var firstSheet = workbook.GetSheetAt(0);

            var result = new List<DistrictDataJsonModel>();
            for (int rowIndex = 4; rowIndex < firstSheet.LastRowNum; rowIndex++)
            {
                var row = firstSheet.GetRow(rowIndex);

                if (row == null)
                    continue;

                result.Add(new DistrictDataJsonModel
                {
                    DistrictCode = (int)row.GetCell(1)?.NumericCellValue,
                    District = row.GetCell(2)?.StringCellValue,
                    Municipality = row.GetCell(3)?.StringCellValue,
                    DistrictPopulationCount = (int)row.GetCell(5)?.NumericCellValue,
                    Incidence = (double)row.GetCell(6)?.NumericCellValue,
                    NewInfectedCount = (int)row.GetCell(7)?.NumericCellValue,
                    PositivePercentage = (double)(row.GetCell(8)?.NumericCellValue),
                    IsClosed = row.GetCell(9)?.StringCellValue?.ToLower() == "nedlukket",
                    StartOfLatestAutomaticShutdown = row.GetCell(10)?.CellType == CellType.String ? null : row.GetCell(10)?.DateCellValue
                });
            }

            return result;
        }
    }
}
